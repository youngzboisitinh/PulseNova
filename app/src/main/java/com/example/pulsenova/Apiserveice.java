package com.example.pulsenova;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;

import retrofit2.Call;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface Apiserveice {
    Gson gson = new GsonBuilder().setDateFormat("dd-MM-yyyy HH:mm:ss").create();
    Apiserveice apiserveice = new Retrofit.Builder()
            .baseUrl("https://00c4-1-53-48-254.ngrok-free.app")
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build().create(Apiserveice.class);

    @POST("/login")
    Call<User> login(@Body User loginUser);

    @POST("/")
    Call<String> sendToken(@Body String token);
}
