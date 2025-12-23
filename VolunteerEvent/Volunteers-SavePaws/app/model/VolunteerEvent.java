package model;

import java.util.Date;

/**
 * Entity: Volunteer Program Model
 */
public class VolunteerEvent {
    private int id;
    private String title;
    private String description;
    private String location;
    private Date startDate;
    private Date endDate;
    private boolean isRegistered; 

    public VolunteerEvent(int id, String title, String description, String location, Date startDate, Date endDate, boolean isRegistered) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.location = location;
        this.startDate = startDate;
        this.endDate = endDate;
        this.isRegistered = isRegistered;
    }
    
    // Getters
    public int getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public boolean isRegistered() { return isRegistered; }
    
    // Setters
    public void setRegistered(boolean registered) { this.isRegistered = registered; }
}