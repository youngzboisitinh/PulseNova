package com.example.pulsenova;

import android.os.Bundle;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;

import java.util.ArrayList;
import java.util.List;


public class NotificationsFragment extends Fragment {

    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_notifications, container, false);

        RecyclerView recyclerView = view.findViewById(R.id.notification_list);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));

        List<Notification> notifications = new ArrayList<>();
        notifications.add(new Notification("General report", "Nov 12, 2024"));
        notifications.add(new Notification("General report", "Nov 11, 2024"));
        notifications.add(new Notification("General report", "Nov 10, 2024"));

        NotificationAdapter adapter = new NotificationAdapter(getContext(), notifications);
        recyclerView.setAdapter(adapter);

        return view;
    }
}