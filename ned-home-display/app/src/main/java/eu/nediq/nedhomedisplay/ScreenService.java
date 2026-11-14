package eu.nediq.nedhomedisplay;

import android.app.Service;
import android.app.Notification;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.IBinder;
import android.os.PowerManager;
import android.content.Context;

public class ScreenService extends Service {
    private PowerManager.WakeLock lock;
    private void status(String message) {
        getSharedPreferences("diagnostics", Context.MODE_PRIVATE).edit().putString("status", message).commit();
    }
    @Override public void onCreate() {
        super.onCreate();
        status("Service started");
        try {
            PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
            if (pm == null) throw new IllegalStateException("PowerManager missing");
            lock = pm.newWakeLock(PowerManager.SCREEN_BRIGHT_WAKE_LOCK, "NEDHomeDisplay:BrightScreen");
            lock.setReferenceCounted(false);
            lock.acquire();
            status("WakeLock acquired");
        } catch (Throwable e) {
            status("WakeLock error: " + e.toString());
        }
        try {
            Intent launch = new Intent(this, MainActivity.class);
            PendingIntent open = PendingIntent.getActivity(this, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT);
            Notification notification = new Notification.Builder(this)
                .setContentTitle("NED Home Display")
                .setContentText("Екранът остава светъл")
                .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
                .setContentIntent(open)
                .setOngoing(true)
                .getNotification();
            startForeground(101, notification);
            String previous = getSharedPreferences("diagnostics", Context.MODE_PRIVATE).getString("status", "");
            status(previous + "; notification OK");
        } catch (Throwable e) {
            String previous = getSharedPreferences("diagnostics", Context.MODE_PRIVATE).getString("status", "");
            status(previous + "; notification error: " + e.toString());
        }
    }
    @Override public int onStartCommand(Intent intent, int flags, int startId) { return START_STICKY; }
    @Override public void onDestroy() {
        try { if (lock != null && lock.isHeld()) lock.release(); } catch (Throwable ignored) {}
        try { stopForeground(true); } catch (Throwable ignored) {}
        super.onDestroy();
    }
    @Override public IBinder onBind(Intent intent) { return null; }
}
