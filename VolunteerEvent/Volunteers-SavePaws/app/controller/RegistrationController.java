package controller;

import model.VolunteerRegistration;
import services.InputValidationService;

public class RegistrationController {

    // MOCK: A static state to simulate whether the current user is registered in the database.
    private static boolean isUserRegistered = false;
    
    private final InputValidationService validationService; 

    public RegistrationController() {
        this.validationService = new InputValidationService();
    }

    public boolean submitRegistration(VolunteerRegistration application) {
        if (!validationService.validateApplication(application)) {
            System.err.println("Validation failed: Input data is incomplete.");
            return false;
        }

        System.out.println("Application submitted and saved for user: " + application.getUserName());
        
        // MOCK: On successful submission, update the status
        isUserRegistered = true; 
        
        return true; 
    }

    /**
     * NEW METHOD: Checks if the user is a registered volunteer.
     */
    public boolean getRegistrationStatus(int userId) {
        // In a real system, this would query the database for the user's VolunteerRegistration record status.
        // For the mock, we return the static state.
        System.out.println("Checking registration status for user: " + userId + ". Status: " + isUserRegistered);
        return isUserRegistered;
    }
}