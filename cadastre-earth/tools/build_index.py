#!/usr/bin/env python3
"""Build a small, exact-ID cadastral GeoJSON index from official KAIS SHP ZIPs.

Input: two official ZIP files for the same settlement (land parcels and buildings).
Output: a JSON lookup suitable for static GitHub Pages. No ownership data.
"""
import argparse, json, zipfile, tempfile
from pathlib import Path
import shapefile
from pyproj import Transformer

def extract(zip_path, directory):
    with zipfile.ZipFile(zip_path) as z:
        for item in z.infolist():
            target = (directory / item.filename).resolve()
            if not target.is_relative_to(directory.resolve()):
                raise ValueError("Unsafe ZIP entry")
        z.extractall(directory)
    shp = list(directory.rglob("*.shp"))
    if not shp:
        raise ValueError(f"No SHP in {zip_path}")
    return shp

def convert(path):
    reader = shapefile.Reader(str(path), encoding="cp1251", encodingErrors="replace")
    fields = [f[0] for f in reader.fields[1:]]
    names = [n for n in fields if n.lower() in ("identifier","ident","id","cad_id","cadnum","cad_num","identifier_","identif")]
    if not names:
        raise ValueError(f"No recognized cadastral identifier field: {fields}")
    id_field = names[0]
    transform = Transformer.from_crs("EPSG:7801", "EPSG:4326", always_xy=True)
    # IMPORTANT: source CRS must be checked from .prj, not assumed.
    prj = path.with_suffix(".prj")
    if not prj.exists():
        raise ValueError(f"Missing CRS .prj for {path}")
    from pyproj import CRS
    transform = Transformer.from_crs(CRS.from_wkt(prj.read_text(errors="replace")), "EPSG:4326", always_xy=True)
    output = {}
    for rec in reader.iterShapeRecords():
        identifier = str(rec.record[fields.index(id_field)]).strip()
        if not identifier or rec.shape.shapeType not in (5,15,25):
            continue
        geo = rec.shape.__geo_interface__
        def walk(c):
            if c and isinstance(c[0], (float,int)):
                return list(transform.transform(c[0],c[1]))
            return [walk(v) for v in c]
        output[identifier] = {"type":"Feature","properties":{"identifier":identifier},"geometry":{"type":geo["type"],"coordinates":walk(geo["coordinates"])}}
    return output

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--parcels",type=Path,required=True)
    p.add_argument("--buildings",type=Path,required=True)
    p.add_argument("--ekatte",required=True)
    p.add_argument("--output",type=Path,required=True)
    a=p.parse_args()
    with tempfile.TemporaryDirectory() as d:
        root=Path(d)
        pfiles=extract(a.parcels,root/"parcels")
        bfiles=extract(a.buildings,root/"buildings")
        parcels={}
        buildings={}
        for file in pfiles: parcels.update(convert(file))
        for file in bfiles: buildings.update(convert(file))
    a.output.parent.mkdir(parents=True,exist_ok=True)
    a.output.write_text(json.dumps({"source":"AGKK KAIS OpenData","ekatte":a.ekatte,"parcels":parcels,"buildings":buildings},ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    print(f"Wrote {len(parcels)} parcels, {len(buildings)} buildings to {a.output}")
if __name__=="__main__": main()
