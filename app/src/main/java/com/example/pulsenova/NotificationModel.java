package com.example.pulsenova;

public class NotificationModel {
    private String title;
    private String date;
    private String body;

    public String getTitle() {
        return title;
    }

    public NotificationModel(String title, String date, String body) {
        this.title = title;
        this.date = date;
        this.body = body;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDate() {
        return date;
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
}
