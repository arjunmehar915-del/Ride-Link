package com.Ridelink.RideLink.Service;

import com.Ridelink.RideLink.Entity.User;

public interface UserService {
    User registerUser(User user);
    User findUserByEmail(String email);
    User findUserById(Long id);
}