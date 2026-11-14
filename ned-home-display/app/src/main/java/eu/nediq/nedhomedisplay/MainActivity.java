package eu.nediq.nedhomedisplay;

import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String HOME_URL = "http://192.168.1.114:8765/";

    @Override public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        LinearLayout layout = new LinearLayout(this);
        layout.setOrientation(LinearLayout.VERTICAL);
        layout.setPadding(24, 24, 24, 24);
        TextView description = new TextView(this);
        description.setText("NED Home Display 1.1\n\nChrome показва NED Home. Отделна услуга поддържа екрана светъл.\n\nНатиснете Старт за включване или Стоп за изключване.");
        description.setTextSize(19);
        layout.addView(description);

        Button start = new Button(this);
        start.setText("СТАРТ — ЕКРАНЪТ ДА НЕ ЗАТЪМНЯВА");
        start.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                startService(new Intent(MainActivity.this, ScreenService.class));
                Intent chrome = new Intent(Intent.ACTION_VIEW, Uri.parse(HOME_URL));
                chrome.setPackage("com.android.chrome");
                try { startActivity(chrome); }
                catch (Exception e) {
                    chrome.setPackage(null);
                    try { startActivity(chrome); }
                    catch (Exception ignored) {
                        Toast.makeText(MainActivity.this, "Не е намерен браузър", Toast.LENGTH_LONG).show();
                    }
                }
            }
        });
        layout.addView(start);

        Button stop = new Button(this);
        stop.setText("СТОП — НОРМАЛНО ЗАТЪМНЯВАНЕ");
        stop.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                stopService(new Intent(MainActivity.this, ScreenService.class));
                Toast.makeText(MainActivity.this, "Поддържането на екрана е изключено", Toast.LENGTH_SHORT).show();
            }
        });
        layout.addView(stop);
        setContentView(layout);
    }
}
