package com.example.pulsenova;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import java.util.List;

import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.Query;

public interface Apiserveice {
    Gson gson = new GsonBuilder().setDateFormat("dd-MM-yyyy HH:mm:ss").create();
    Apiserveice apiserveice = new Retrofit.Builder()
            .baseUrl("https://b26c-58-186-197-9.ngrok-free.app")
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build().create(Apiserveice.class);

    @POST("/login")
    Call<User> login(@Body User loginUser);

    @POST("/")
    Call<String> sendToken(@Body String token);

    @GET("/data")
    Call<List<NotificationModel>> getNotification();
}
