package com.financetracker.app;

import android.net.ConnectivityManager;
import android.net.Network;
import android.net.NetworkCapabilities;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private ConnectivityManager connectivityManager;
    private boolean wasOffline;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private final ConnectivityManager.NetworkCallback networkCallback = new ConnectivityManager.NetworkCallback() {
        @Override
        public void onCapabilitiesChanged(Network network, NetworkCapabilities capabilities) {
            reloadWhenConnectionIsValidated();
        }

        @Override
        public void onAvailable(Network network) {
            // Validation can arrive just after a network becomes available.
            // Check again shortly so the offline page is replaced reliably.
            mainHandler.postDelayed(MainActivity.this::reloadWhenConnectionIsValidated, 1_000);
        }

        @Override
        public void onLost(Network network) {
            wasOffline = true;
        }
    };

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        connectivityManager = getSystemService(ConnectivityManager.class);
        if (connectivityManager != null) {
            wasOffline = !hasValidatedConnection();
            connectivityManager.registerDefaultNetworkCallback(networkCallback);
        }
    }

    private boolean hasValidatedConnection() {
        if (connectivityManager == null) return false;
        Network network = connectivityManager.getActiveNetwork();
        NetworkCapabilities capabilities = connectivityManager.getNetworkCapabilities(network);
        return capabilities != null
                && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
                && capabilities.hasCapability(NetworkCapabilities.NET_CAPABILITY_VALIDATED);
    }

    private void reloadWhenConnectionIsValidated() {
        if (!wasOffline || !hasValidatedConnection()) return;
        wasOffline = false;
        if (getBridge() != null) {
            // Bridge.reload() reloads the configured remote app URL, unlike a
            // WebView reload that can remain on Android's offline error page.
            getBridge().reload();
        }
    }

    @Override
    public void onDestroy() {
        if (connectivityManager != null) {
            connectivityManager.unregisterNetworkCallback(networkCallback);
        }
        mainHandler.removeCallbacksAndMessages(null);
        super.onDestroy();
    }
}
