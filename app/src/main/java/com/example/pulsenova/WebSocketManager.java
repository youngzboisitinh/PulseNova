package com.example.pulsenova;

import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.WebSocket;
import okhttp3.WebSocketListener;
import okio.ByteString;

public class WebSocketManager {
    private WebSocket webSocket;
    private OkHttpClient client;

    public void startWebSocket(){
        client = new OkHttpClient();

        Request request = new Request.Builder()
                .url("wss:6b7b-1-53-82-235.ngrok-free.app")
                .build();
        webSocket = client.newWebSocket(request, new WebSocketListener() {
            @Override
            public void onOpen(WebSocket webSocket, Response response) {
                super.onOpen(webSocket, response);
                Log.e("WebSocket", "Connected to WebSocket server");
            }

            @Override
            public void onClosing(WebSocket webSocket, int code, String reason) {
                super.onClosing(webSocket, code, reason);
                Log.d("WebSocket", "WebSocket closing: " + reason);
            }

            @Override
            public void onClosed(WebSocket webSocket, int code, String reason) {
                super.onClosed(webSocket, code, reason);
                Log.d("WebSocket", "WebSocket closed: " + reason);
            }
            @Override
            public void onMessage(WebSocket webSocket, String text) {
                super.onMessage(webSocket, text);
                Log.d("WebSocket", text);
            }

            @Override
            public void onFailure(WebSocket webSocket, Throwable t, okhttp3.Response response) {
                super.onFailure(webSocket, t, response);
                System.out.println("WebSocket error: " + t.getMessage());
            }
        });
        client.dispatcher().executorService().shutdown();
    }
    public void sendMessage(String message) {
        if (webSocket != null) {
            webSocket.send(message); // Gửi tin nhắn đến server
        }
    }
}
