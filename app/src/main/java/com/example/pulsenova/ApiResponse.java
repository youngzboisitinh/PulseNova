package com.example.pulsenova;

public class ApiResponse {
    private boolean success;
    private String error;

    public boolean isSuccess() {
        return success;
    }

    public ApiResponse(boolean success, String error) {
        this.success = success;
        this.error = error;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
