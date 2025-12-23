package services;

import model.VolunteerRegistration;

public class InputValidationService {

    public boolean validateApplication(VolunteerRegistration application) {
        return application.getUserName() != null && !application.getUserName().trim().isEmpty() &&
               application.getAddress() != null && !application.getAddress().trim().isEmpty() &&
               application.getExperience() != null && !application.getExperience().trim().isEmpty() &&
               application.getCapability() != null && !application.getCapability().trim().isEmpty();
    }
}
