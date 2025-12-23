package services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import model.VolunteerEvent;

public class ParticipationTrackingService {
    
    private final List<VolunteerEvent> programList;

    public ParticipationTrackingService() {
        // Mock Data
        programList = new ArrayList<>();
        programList.add(new VolunteerEvent(101, "Beach Cleanup", "Clear plastics and debris.", "Coastal Reserve", new Date(), new Date(), false));
        programList.add(new VolunteerEvent(102, "Tree Planting", "Help reforestation effort.", "City Park", new Date(), new Date(), true));
    }

    public List<VolunteerEvent> getAvailablePrograms() {
        return new ArrayList<>(programList); 
    }

    public List<VolunteerEvent> getRecentAvailablePrograms(int limit) {
        if (programList.size() <= limit) {
            return new ArrayList<>(programList);
        }
        // Returns the first 'limit' events
        return programList.subList(0, limit);
    }

    public boolean registerForProgram(int programId) {
        // Implementation: Updates data store for registration
        for (VolunteerEvent program : programList) {
            if (program.getId() == programId && !program.isRegistered()) {
                program.setRegistered(true);
                return true;
            }
        }
        return false;
    }
}
