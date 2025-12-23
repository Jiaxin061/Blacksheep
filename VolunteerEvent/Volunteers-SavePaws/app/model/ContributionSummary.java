package model;

import java.util.List;

/**
 * Data Transfer Object (DTO) for the Volunteer Contribution Page
 * Combines contribution records and featured event snippets.
 */
public class ContributionSummary {
    private final List<VolunteerContribution> contributions;
    private final List<VolunteerEvent> featuredEvents;

    public ContributionSummary(List<VolunteerContribution> contributions, List<VolunteerEvent> featuredEvents) {
        this.contributions = contributions;
        this.featuredEvents = featuredEvents;
    }

    // Getters for frontend consumption
    public List<VolunteerContribution> getContributions() { return contributions; }
    public List<VolunteerEvent> getFeaturedEvents() { return featuredEvents; }
}