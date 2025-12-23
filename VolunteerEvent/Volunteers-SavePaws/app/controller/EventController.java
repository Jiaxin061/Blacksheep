package controller;

import java.util.List;

import model.VolunteerEvent;
import services.ParticipationTrackingService;
import services.UserNotificationService;


public class EventController {
    
    private final ParticipationTrackingService programService;
    private final UserNotificationService notificationService;

    public EventController() {
        this.programService = new ParticipationTrackingService();
        this.notificationService = new UserNotificationService();
    }

    public List<VolunteerEvent> getAvailablePrograms() {
        try {
            // Retrieves event list (UC18: NF2)
            List<VolunteerEvent> programs = programService.getAvailablePrograms();
            return programs;
        } catch (Exception e) {
            System.err.println("Error retrieving program list: " + e.getMessage()); 
            return null; 
        }
    }

    public boolean joinProgram(int userId, int programId) {
        // 1. Stores registration record (UC18: NF7.2)
        boolean success = programService.registerForProgram(programId);

        if (success) {
            // 2. Sends confirmation notification
            notificationService.sendNotification(userId, "You have successfully registered for the event!");
        }
        return success;
    }
}