package services;

public class UserNotificationService {

    public void sendNotification(int userId, String message) {
        System.out.println("[Notification] To user " + userId + ": " + message);
    }
}
