package model;

import java.util.Date;

/**
 * Entity: Volunteer Contribution Model
 */
public class VolunteerContribution {
    private String eventTitle;
    private int hoursSpent;
    private Date completionDate;
    private String status; 
    private int userId;

    public VolunteerContribution(String eventTitle, int hoursSpent, Date completionDate, String status, int userId) {
        this.eventTitle = eventTitle;
        this.hoursSpent = hoursSpent;
        this.completionDate = completionDate;
        this.status = status;
        this.userId = userId;
    }
    
    // Getters
    public String getEventTitle() { return eventTitle; }
    public int getHoursSpent() { return hoursSpent; }
    public Date getCompletionDate() { return completionDate; }
    public String getStatus() { return status; }
    public int getUserId() { return userId; }
}