package model;

public class VolunteerRegistration {
    private int userID;
    private String userName;
    private String address; 
    private String experience;
    private String capability;
    private String status; 

    public VolunteerRegistration(int userID, String userName, String address, String experience, String capability) {
        this.userID = userID;
        this.userName = userName;
        this.address = address;
        this.experience = experience;
        this.capability = capability;
        this.status = "Pending";
    }

    // Getters
    public int getUserID() { return userID; }
    public String getUserName() { return userName; }
    public String getAddress() { return address; }
    public String getExperience() { return experience; }
    public String getCapability() { return capability; }
}
