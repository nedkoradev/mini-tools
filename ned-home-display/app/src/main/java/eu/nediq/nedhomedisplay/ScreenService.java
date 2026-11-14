package eu.nediq.nedhomedisplay;

import android.app.Service;
import android.app.Notification;
import android.app.PendingIntent;
import android.content.Intent;
import android.os.IBinder;
import android.os.PowerManager;

public class ScreenService extends Service {
    private PowerManager.WakeLock lock;

    @Override public void onCreate() {
        super.onCreate();
        PowerManager pm = (PowerManager) getSystemService(POWER_SERVICE);
        lock = pm.newWakeLock(PowerManager.SCREEN_BRIGHT_WAKE_LOCK, "NEDHomeDisplay:BrightScreen");
        lock.setReferenceCounted(false);
        lock.acquire();
        Intent launch = new Intent(this, MainActivity.class);
        PendingIntent open = PendingIntent.getActivity(this, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT);
        Notification notification = new Notification.Builder(this)
            .setContentTitle("NED Home Display")
            .setContentText("Екранът остава светъл — натиснете за Стоп")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setContentIntent(open)
            .setOngoing(true)
            .build();
        startForeground(101, notification);
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        return START_STICKY;
    }

    @Override public void onDestroy() {
        if (lock != null && lock.isHeld()) lock.release();
        stopForeground(true);
        super.onDestroy();
    }

    @Override public IBinder onBind(Intent intent) { return null; }
}
