package services;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

import model.ContributionSummary;
import model.VolunteerContribution;
import model.VolunteerEvent;

public class ContributionRetrievalService {
    
    private final List<VolunteerContribution> contributionList;
    private final ParticipationTrackingService participationService; // NEW: Dependency injection

    public ContributionRetrievalService() {
        // Mock Data
        contributionList = new ArrayList<>();
        contributionList.add(new VolunteerContribution("Past Event A", 8, new Date(System.currentTimeMillis() - 86400000L * 30), "Completed", 1));
        contributionList.add(new VolunteerContribution("Ongoing Project B", 4, new Date(), "Ongoing", 1));
        
        this.participationService = new ParticipationTrackingService();
    }

    public List<VolunteerContribution> getContributionsByUserId(int userId) {
        return contributionList.stream()
                .filter(c -> c.getUserId() == userId)
                .collect(Collectors.toList());
    }

    public ContributionSummary getContributionPageSummary(int userId) {
        // 1. Get contributions
        List<VolunteerContribution> contributions = getContributionsByUserId(userId);
        
        // 2. Get a snippet of events (top 2 for the homepage snippet)
        List<VolunteerEvent> featuredEvents = participationService.getRecentAvailablePrograms(2);
        
        // 3. Combine and return
        return new ContributionSummary(contributions, featuredEvents);
    }
}
