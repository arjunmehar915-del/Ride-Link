package com.Ridelink.RideLink.Service.Impl;

import com.Ridelink.RideLink.Entity.Ride;
import com.Ridelink.RideLink.Entity.RideStatus;
import com.Ridelink.RideLink.Entity.User;
import com.Ridelink.RideLink.Exception.ResourceNotFoundException;
import com.Ridelink.RideLink.Repository.RideRepository;
import com.Ridelink.RideLink.Repository.UserRepository;
import com.Ridelink.RideLink.Service.RideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class RideServiceImpl implements RideService {

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public Ride createRide(Ride ride, Long driverId) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + driverId));

        ride.setDriver(driver);
        ride.setStatus(RideStatus.OPEN);
        ride.setAvailableSeats(ride.getTotalSeats());
        return rideRepository.save(ride);
    }

    @Override
    public List<Ride> searchRides(String source, String destination, LocalDateTime departureTime) {
        return rideRepository.findAvailableRides(source, destination, departureTime);
    }

    @Override
    public Ride getRideById(Long id) {
        return rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + id));
    }
}