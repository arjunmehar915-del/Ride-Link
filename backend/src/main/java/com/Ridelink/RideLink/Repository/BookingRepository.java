package com.Ridelink.RideLink.Repository;

import com.Ridelink.RideLink.Entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerId(Long passengerId);
    Optional<Booking> findByRideIdAndRideOtp(Long rideId, String rideOtp);
}