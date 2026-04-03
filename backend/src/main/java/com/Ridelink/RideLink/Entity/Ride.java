package com.Ridelink.RideLink.Entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "rides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ride {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "driver_id", nullable = false)
    private User driver;

    @Column(nullable = false)
    private String sourceName;
    private Double sourceLatitude;
    private Double sourceLongitude;

    @Column(nullable = false)
    private String destinationName;
    private Double destinationLatitude;
    private Double destinationLongitude;

    @Column(nullable = false)
    private LocalDateTime departureTime;

    @Column(nullable = false)
    private Double pricePerSeat;

    @Column(nullable = false)
    private Integer totalSeats;

    @Column(nullable = false)
    private Integer availableSeats;

    @Enumerated(EnumType.STRING)
    private RideStatus status;
}