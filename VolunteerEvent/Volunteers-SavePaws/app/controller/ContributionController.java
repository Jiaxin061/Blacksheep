package controller;

import java.util.List;

import model.ContributionSummary;
import model.VolunteerContribution;
import services.ContributionRetrievalService;

public class ContributionController {
    
    private final ContributionRetrievalService retrievalService;

    public ContributionController() {
        this.retrievalService = new ContributionRetrievalService();
    }

    public List<VolunteerContribution> getContributions(int userId) {
        try {
            // Retrieves records (UC: View Contribution, NF2)
            List<VolunteerContribution> contributions = retrievalService.getContributionsByUserId(userId);
            return contributions;
        } catch (Exception e) {
            System.err.println("Error retrieving contributions: " + e.getMessage()); 
            return null; 
        }
    }

    public ContributionSummary getContributionSummary(int userId) {
        try {
            // Retrieves contributions and a small event list
            ContributionSummary summary = retrievalService.getContributionPageSummary(userId);
            return summary;
        } catch (Exception e) {
            System.err.println("Error retrieving contribution summary: " + e.getMessage());
            return null;
        }
    }
}