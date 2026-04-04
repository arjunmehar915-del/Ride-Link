package com.Ridelink.RideLink.DTO;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class RideRequestDto {
    private String sourceName;
    private Double sourceLatitude;
    private Double sourceLongitude;
    private String destinationName;
    private Double destinationLatitude;
    private Double destinationLongitude;
    private LocalDateTime departureTime;
    private Double pricePerSeat;
    private Integer totalSeats;
}