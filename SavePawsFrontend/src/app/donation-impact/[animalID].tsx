import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import {
    fetchAnimalDetails,
    getDonationImpact,
    getDonationImpactDetail,
} from "../../services/api";
import { colors } from "../../theme/colors";
import { getImageUrl } from "../../utils/imageHelper";

interface AnimalDetails {
    id: number;
    name: string;
    type: string;
    story: string;
    photoURL: string;
    amountRaised: number;
    fundingGoal: number;
    status: string;
}

interface Allocation {
    allocationID: number;
    category: string;
    amount: number;
    totalCost?: number;
    donationCoveredAmount?: number;
    externalCoveredAmount?: number;
    externalFundingSource?: string;
    fundingStatus?: string;
    allocationType?: string;
    publicDescription?: string;
    description?: string;
    allocationDate: string;
    status?: string;
}

interface UserDonation {
    transactionID: number;
    amount: number;
    date: string;
    status: string; // e.g. "Completed" or "Allocated"
}

interface ProgressUpdate {
    updateID: number;
    title: string;
    description: string;
    medicalCondition?: string;
    recoveryStatus: string;
    updateDate: string;
}

type RootStackParamList = {
    AnimalImpact: { animalID: string };
    DonationReceipt: { transactionID: string };
};

export default function AnimalImpactScreen() {

    const navigation = useNavigation<any>();
    const route = useRoute<RouteProp<RootStackParamList, 'AnimalImpact'>>();

    const { animalID } = route.params || {};

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [animal, setAnimal] = useState<AnimalDetails | null>(null);
    const [allocations, setAllocations] = useState<Allocation[]>([]);
    const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
    const [userDonations, setUserDonations] = useState<UserDonation[]>([]);
    const [totalUserDonated, setTotalUserDonated] = useState(0);

    const loadData = async () => {
        if (!animalID) return;
        try {
            setError(null);

            // 1. Fetch Basic Animal Info & User's Donation List
            const [animalData, impactData] = await Promise.all([
                fetchAnimalDetails(animalID),
                getDonationImpact()
            ]);

            setAnimal(animalData);

            // 2. Identify User's Donations to this Animal
            const animalImpact = (impactData?.donations || []).find(
                (d: any) => d.animalID.toString() === animalID.toString()
            );

            // Then map the detailed history if it exists
            const history = (animalImpact && animalImpact.donationHistory) ?
                animalImpact.donationHistory.map((d: any) => ({
                    transactionID: d.transactionID,
                    amount: d.donationAmount,
                    date: d.donationDate,
                    status: "Completed",
                })) : [];

            setUserDonations(history);
            setTotalUserDonated(animalImpact?.donationAmount || 0);

            // 3. Fetch Impact Details (Allocations & Updates) via a valid Transaction ID
            // We use the most recent transaction to fetch the comprehensive impact view
            if (animalImpact && animalImpact.transactionID) {
                const details = await getDonationImpactDetail(animalImpact.transactionID);
                if (details) {
                    setAllocations(details.allocations || []);
                    setUpdates(details.progressUpdates || []);
                }
            } else {
                setAllocations([]);
                setUpdates([]);
            }

        } catch (err: any) {
            console.error("Error loading animal impact:", err);
            // More friendly error
            if (err?.response?.status === 403) {
                setError("Authorization error. Please log in.");
            } else {
                setError("Failed to load information.");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [animalID]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading impact details...</Text>
            </View>
        );
    }

    if (error || !animal) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>{error || "Animal not found."}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={loadData}>
                    <Text style={styles.retryText}>Retry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <ScrollView
            contentContainerStyle={styles.container}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
            {/* HEADER: Animal Info */}
            <View style={styles.headerCard}>
                <Image source={{ uri: getImageUrl(animal.photoURL) }} style={styles.animalImage} />
                <View style={styles.headerContent}>
                    <Text style={styles.animalName}>{animal.name}</Text>
                    <Text style={styles.animalType}>{animal.type}</Text>

                    <View style={styles.statsRow}>
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>You Donated</Text>
                            <Text style={styles.statValue}>${totalUserDonated.toFixed(2)}</Text>
                        </View>
                        <View style={styles.statSeparator} />
                        <View style={styles.statItem}>
                            <Text style={styles.statLabel}>Total Raised</Text>
                            <Text style={styles.statValue}>${(animal.amountRaised || 0).toFixed(2)}</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* SECTION A: Allocation Impact (Animal Level) */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>How Funds Are Used</Text>
                <Text style={styles.subtitle}>Combined impact for {animal.name}</Text>

                {allocations.length === 0 ? (
                    <Text style={styles.emptyText}>No funds have been allocated yet. Stay tuned!</Text>
                ) : (
                    allocations.map(alloc => (
                        <View key={alloc.allocationID} style={styles.allocationCard}>
                            <View style={styles.allocationHeader}>
                                <View>
                                    <Text style={styles.allocCategory}>{alloc.category}</Text>
                                    {alloc.allocationType && <Text style={styles.allocType}>{alloc.allocationType}</Text>}
                                </View>
                                <Text style={styles.allocAmount}>${(alloc.totalCost || alloc.amount).toFixed(2)}</Text>
                            </View>

                            {/* Description */}
                            {(alloc.publicDescription || alloc.description) && (
                                <Text style={styles.allocDesc}>{alloc.publicDescription || alloc.description}</Text>
                            )}

                            {/* Funding Status */}
                            <View style={styles.allocFooter}>
                                <View style={[styles.statusBadge, alloc.fundingStatus === "Fully Funded" ? styles.badgeSuccess : styles.badgeWarning]}>
                                    <Text style={styles.statusText}>{alloc.fundingStatus || "Fully Funded"}</Text>
                                </View>
                                <Text style={styles.allocDate}>{formatDate(alloc.allocationDate)}</Text>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* SECTION: Progress Updates */}
            {updates.length > 0 && (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Latest Updates</Text>
                    {updates.map(update => (
                        <View key={update.updateID} style={styles.updateCard}>
                            <Text style={styles.updateTitle}>{update.title}</Text>
                            <Text style={styles.updateBody}>{update.description}</Text>
                            {update.medicalCondition && <Text style={styles.updateCondition}>Condition: {update.medicalCondition}</Text>}
                            <View style={styles.updateFooter}>
                                <Text style={styles.recoveryBadge}>{update.recoveryStatus}</Text>
                                <Text style={styles.updateDate}>{formatDate(update.updateDate)}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            )}

            {/* SECTION B: Your Donation History */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Your Donations to {animal.name}</Text>
                {userDonations.length === 0 ? (
                    <Text style={styles.emptyText}>No donations found.</Text>
                ) : (
                    userDonations.map(donation => (
                        <TouchableOpacity
                            key={donation.transactionID}
                            style={styles.donationRow}
                            onPress={() => navigation.navigate('DonationReceipt', { transactionID: donation.transactionID })}                        >
                            <View style={styles.donationInfo}>
                                <Text style={styles.donationAmount}>${donation.amount.toFixed(2)}</Text>
                                <Text style={styles.donationDate}>{formatDate(donation.date)}</Text>
                            </View>
                            <View style={styles.donationMeta}>
                                <Text style={styles.txnId}>#{donation.transactionID}</Text>
                                <Text style={styles.chevron}>›</Text>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </View>

        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
        backgroundColor: colors.background,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: colors.textSecondary,
    },
    errorText: {
        color: colors.danger,
        fontSize: 16,
        marginBottom: 20,
    },
    retryButton: {
        backgroundColor: colors.primary,
        padding: 10,
        borderRadius: 8,
        marginBottom: 10
    },
    retryText: { color: "#FFF" },
    backButton: {},
    backButtonText: { color: colors.primary },

    headerCard: {
        backgroundColor: colors.surface,
        marginBottom: 16,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 4,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 8,
        overflow: 'hidden'
    },
    animalImage: {
        width: '100%',
        height: 220,
        resizeMode: 'cover'
    },
    headerContent: {
        padding: 20,
    },
    animalName: {
        fontSize: 28,
        fontWeight: '800',
        color: colors.textPrimary,
    },
    animalType: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: 16,
    },
    statsRow: {
        flexDirection: 'row',
        backgroundColor: colors.background,
        padding: 16,
        borderRadius: 12,
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        textTransform: 'uppercase',
        fontWeight: '600'
    },
    statValue: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.primary,
        marginTop: 4
    },
    statSeparator: {
        width: 1,
        height: '80%',
        backgroundColor: colors.border
    },

    section: {
        paddingHorizontal: 16,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 4
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 16
    },
    emptyText: {
        fontStyle: 'italic',
        color: colors.textSecondary,
        marginTop: 8
    },

    // Allocation Card
    allocationCard: {
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: colors.primary,
        elevation: 2,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
    },
    allocationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    allocCategory: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary
    },
    allocType: {
        fontSize: 12,
        color: colors.textSecondary
    },
    allocAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary
    },
    allocDesc: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 12,
        lineHeight: 20
    },
    allocFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.border,
        paddingTop: 8
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6
    },
    badgeSuccess: { backgroundColor: colors.success },
    badgeWarning: { backgroundColor: colors.warning },
    statusText: { color: '#FFF', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    allocDate: { fontSize: 12, color: colors.textSecondary },

    // Updates
    updateCard: {
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        elevation: 1
    },
    updateTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
    updateBody: { fontSize: 14, lineHeight: 20, color: colors.textSecondary, marginBottom: 8 },
    updateCondition: { fontSize: 13, color: colors.primary, marginBottom: 8, fontWeight: '500' },
    updateFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 },
    recoveryBadge: { fontSize: 12, fontWeight: '600', color: colors.success },
    updateDate: { fontSize: 12, color: colors.textSecondary },

    // Donation Row
    donationRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: colors.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 1
    },
    donationInfo: {
    },
    donationAmount: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.textPrimary
    },
    donationDate: {
        fontSize: 13,
        color: colors.textSecondary,
        marginTop: 2
    },
    donationMeta: {
        alignItems: 'flex-end',
        flexDirection: 'row',
    },
    txnId: {
        fontSize: 12,
        color: colors.textSecondary,
        marginRight: 8
    },
    chevron: {
        fontSize: 20,
        color: colors.textSecondary,
        fontWeight: '300'
    }
});
