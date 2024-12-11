package com.example.pulsenova;

import android.os.Bundle;
import android.content.Intent;
import android.view.LayoutInflater;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

public class ProfileFragment extends Fragment {
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, @Nullable ViewGroup container, @Nullable Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_profile, container, false);

        View signOutCard = view.findViewById(R.id.card_sign_out);

        signOutCard.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                signOut();
            }
        });

        return view;
    }

    private void signOut() {

        getActivity().getSharedPreferences("user_prefs", 0).edit().clear().apply();
        Toast.makeText(getContext(), "Signed out successfully", Toast.LENGTH_SHORT).show();
        Intent intent = new Intent(getActivity(),WelcomeActivity.class);
        startActivity(intent);
        getActivity().finish();
    }
}