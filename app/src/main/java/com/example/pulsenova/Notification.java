package com.example.pulsenova;

public class Notification {
    private String title;
    private String date;
    private String body;


    public void setTitle(String title) {
        this.title = title;
    }

    public Notification(String title, String date, String body) {
        this.title = title;
        this.date = date;
        this.body = body;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getTitle() {
        return title;
    }

    public String getDate() {
        return date;
    }
}
