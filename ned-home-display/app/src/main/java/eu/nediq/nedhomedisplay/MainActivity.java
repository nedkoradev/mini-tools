package eu.nediq.nedhomedisplay;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.content.Context;
import android.net.Uri;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String HOME_URL = "http://192.168.1.114:8765/";
    private TextView diagnostic;
    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(24, 24, 24, 24);
        TextView description = new TextView(this);
        description.setText("NED Home Display 1.2\n\nChrome показва NED Home. Отделна услуга поддържа екрана светъл.");
        description.setTextSize(19);
        layout.addView(description);
        Button start = new Button(this);
        start.setText("СТАРТ — ЕКРАНЪТ ДА НЕ ЗАТЪМНЯВА");
        start.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                try {
                    startService(new Intent(MainActivity.this, ScreenService.class));
                } catch (Throwable e) {
                    getSharedPreferences("diagnostics", Context.MODE_PRIVATE).edit().putString("status", "startService error: " + e.toString()).commit();
                }
                updateDiagnostic();
                Intent chrome = new Intent(Intent.ACTION_VIEW, Uri.parse(HOME_URL));
                chrome.setPackage("com.android.chrome");
                try { startActivity(chrome); }
                catch (Throwable e) {
                    chrome.setPackage(null);
                    try { startActivity(chrome); }
                    catch (Throwable ignored) { Toast.makeText(MainActivity.this, "Не е намерен браузър", Toast.LENGTH_LONG).show(); }
                }
            }
        });
        layout.addView(start);
        Button stop = new Button(this);
        stop.setText("СТОП — НОРМАЛНО ЗАТЪМНЯВАНЕ");
        stop.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                try { stopService(new Intent(MainActivity.this, ScreenService.class)); }
                catch (Throwable e) { Toast.makeText(MainActivity.this, e.toString(), Toast.LENGTH_LONG).show(); }
                updateDiagnostic();
            }
        });
        layout.addView(stop);
        diagnostic = new TextView(this);
        diagnostic.setTextSize(16);
        layout.addView(diagnostic);
        setContentView(layout);
        updateDiagnostic();
    }
    @Override protected void onResume() { super.onResume(); if (diagnostic != null) updateDiagnostic(); }
    private void updateDiagnostic() {
        String message = getSharedPreferences("diagnostics", Context.MODE_PRIVATE).getString("status", "Още няма диагностика");
        diagnostic.setText("Диагностика: " + message);
    }
}
