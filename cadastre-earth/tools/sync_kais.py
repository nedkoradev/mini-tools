#!/usr/bin/env python3
"""Best-effort official KAIS OpenData sync. No bypass of access restrictions."""
import argparse, io, json, re, sys, tempfile, zipfile
from pathlib import Path
from urllib.parse import quote
import requests
from build_index import convert

BASE="https://kais.cadastre.bg"
def main():
    p=argparse.ArgumentParser()
    p.add_argument("--ekatte",required=True)
    p.add_argument("--output",type=Path,required=True)
    args=p.parse_args()
    session=requests.Session()
    session.headers.update({"User-Agent":"mini-tools cadastral open-data updater/0.4 (+GitHub Actions)"})
    r=session.get(BASE+"/bg/OpenData",timeout=25)
    r.raise_for_status()
    match=re.search(r'name="csrf-token"\s+content="([^"]+)"',r.text) or re.search(r'name="__RequestVerificationToken"[^>]*value="([^"]+)"',r.text)
    if not match:
        raise RuntimeError("KAIS did not provide a CSRF token; no update performed")
    session.headers["X-CSRF-TOKEN"]=match.group(1)
    def read(path=None):
        r=session.post(BASE+"/bg/OpenData/Read",data={"target":path} if path else None,timeout=30)
        r.raise_for_status()
        data=r.json()
        if not isinstance(data,list):
            raise RuntimeError("Unexpected KAIS directory response")
        return data
    # Discover only the relevant municipality/settlement rather than bulk download.
    frontier=[("",read())]
    candidates=[]
    while frontier:
        prefix,entries=frontier.pop(0)
        for entry in entries:
            if prefix == "" and not re.search("бургас|burgas",str(entry.get("Name","")),re.I):
                continue
            name=str(entry.get("Name",""))
            path=str(entry.get("Path") or (prefix+"/"+name).strip("/"))
            is_dir=entry.get("IsDirectory") or entry.get("HasDirectories") or not name.lower().endswith(".zip")
            if name.lower().endswith(".zip"):
                if args.ekatte in path or args.ekatte in name:
                    candidates.append((path,name))
                continue
            if path.count("/")>4: continue
            if len(frontier)>200: raise RuntimeError("Directory traversal exceeded safety limit")
            try:
                children=read(path)
            except requests.HTTPError as exc:
                if exc.response is not None and exc.response.status_code in (401,403,429):
                    raise RuntimeError(f"KAIS denied access ({exc.response.status_code}); stopping immediately without further requests") from exc
                print(f"Cannot list {path}: {exc}",file=sys.stderr)
                continue
            except requests.RequestException as exc:
                print(f"Cannot list {path}: {exc}",file=sys.stderr)
                continue
            # Follow directories that contain target EKATTE, Burgas, or are upper-level directories.
            if args.ekatte in path or re.search("бургас|burgas",path,re.I) or path.count("/")<2:
                frontier.append((path,children))
    if not candidates:
        raise RuntimeError("No official ZIP archives found for EKATTE "+args.ekatte)
    building=[x for x in candidates if re.search("сград|build",x[1],re.I)]
    parcel=[x for x in candidates if re.search("позем|land|parcel",x[1],re.I)]
    if not building or not parcel:
        raise RuntimeError("Both building and land parcel archives were not found: "+repr(candidates))
    def get_archive(candidate,folder):
        path,name=candidate
        r=session.get(BASE+"/bg/OpenData/Download?path="+quote(path,safe=""),timeout=90)
        r.raise_for_status()
        if not zipfile.is_zipfile(io.BytesIO(r.content)):
            raise RuntimeError("KAIS did not return a valid ZIP for "+name)
        folder.mkdir(parents=True,exist_ok=True)
        with zipfile.ZipFile(io.BytesIO(r.content)) as z:
            for item in z.infolist():
                dest=(folder/item.filename).resolve()
                if not dest.is_relative_to(folder.resolve()):
                    raise RuntimeError("Unsafe ZIP path")
            z.extractall(folder)
        shp=list(folder.rglob("*.shp"))
        if not shp: raise RuntimeError("No SHP found in "+name)
        return shp
    with tempfile.TemporaryDirectory() as temp:
        root=Path(temp)
        bf=get_archive(building[0],root/"buildings")
        pf=get_archive(parcel[0],root/"parcels")
        buildings={}
        parcels={}
        for f in bf: buildings.update(convert(f))
        for f in pf: parcels.update(convert(f))
    if not buildings or not parcels:
        raise RuntimeError("No cadastral polygons found; refusing to publish empty index")
    # Validate that the pilot test parcel is present before first publication.
    if args.ekatte=="07079" and "07079.602.153" not in parcels:
        raise RuntimeError("Pilot parcel 07079.602.153 not present; check dataset and identifiers")
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(json.dumps({"source":"АГКК КАИС Отворени данни","ekatte":args.ekatte,"parcels":parcels,"buildings":buildings},ensure_ascii=False,separators=(",",":")),encoding="utf-8")
    print("Indexed",len(parcels),"parcels and",len(buildings),"buildings")
if __name__=="__main__":
    main()
