import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../theme/colors';

export const PolicyScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Policy</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Icon name="shield-checkmark" size={48} color={colors.primaryDark} style={styles.icon} />
          <Text style={styles.lastUpdated}>Last updated: July 2026</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.welcomeText}>Assalamualaikum! DoorStore pe khush aamdeed</Text>
          <Text style={styles.bodyText}>
            DoorStore se aap taza Sabziyan, Phal aur Gosht order kar sakte hain jo ke aapko <Text style={styles.highlight}>1 ghante ke andar</Text> aapke Door Step pe mil jayegi. ✅
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>1. Order Kaise Hoga?</Text>
          <Text style={styles.listItem}>1. App se product select karein, cart mein add karein.</Text>
          <Text style={styles.listItem}>2. Address aur number theek likhein. Ghalat address pe delivery nahi hogi.</Text>
          <Text style={styles.listItem}>3. Order Confirm hote hi aapko SMS/Call aa jayega.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>2. Payment Ka Tareeqa</Text>
          <Text style={styles.bodyText}>Abhi sirf <Text style={styles.highlight}>Cash on Delivery (COD)</Text> hai ✅</Text>
          <Text style={styles.bodyText}>Rider samaan dega, aap usi waqt cash pay karein.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>3. Delivery Area, Time & Charges 🚚</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Area:</Text> Hum <Text style={styles.highlight}>Thokar Niaz Baig se le kar Bahria Town</Text> aur is darmiyan aane wali tamam societies mein deliver karte hain.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Time:</Text> Order subah <Text style={styles.highlight}>9 Baje se Raat 9 Baje</Text> tak same day deliver hoga.</Text>
          <Text style={styles.listItem}><Text style={styles.bold}>Charges:</Text> Delivery charges aapke area ke hisaab se honge. App pe order karte waqt show ho jayenge.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>4. Minimum Order 🚨</Text>
          <Text style={styles.bodyText}><Text style={styles.highlight}>Minimum Order Rs. 500</Text> hai. Rs. 500 se kam ka order accept nahi hoga.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>5. Samaan Kharab Nikla To?</Text>
          <Text style={styles.bodyText}>Sabzi, Phal, Gosht ki guarantee hai ✅</Text>
          <Text style={styles.bodyText}>Agar samaan kharab ya wazan kam nikla to <Text style={styles.highlight}>foran rider ko wapis kar dein</Text>.</Text>
          <Text style={styles.bodyText}>Same day replacement ya paise wapis.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>6. Order Cancel Kaise Hoga?</Text>
          <Text style={styles.bodyText}>Rider nikalne se pehle tak cancel kar sakte hain. Call kar dein.</Text>
          <Text style={styles.bodyText}>Rider nikal gaya to cancel nahi hoga kyunki COD hai.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>7. Hamara Wada 🔒</Text>
          <Text style={styles.listItem}>1. Taza samaan, sahi wazan, 1 Ghante ki Delivery.</Text>
          <Text style={styles.listItem}>2. Aapka Naam, Number aur Address hamare paas mehfooz rahega. Ye data 100% secret hai aur kisi 3rd party ko nahi diya jayega.</Text>
        </View>

        <View style={[styles.card, styles.contactCard]}>
          <Text style={styles.contactTitle}>Koi masla ho to Contact karein:</Text>
          <View style={styles.contactRow}>
            <Icon name="logo-whatsapp" size={20} color={colors.primaryDark} style={styles.contactIcon} />
            <Text style={styles.contactText}>0302-5769675</Text>
          </View>
          <View style={styles.contactRow}>
            <Icon name="mail-outline" size={20} color={colors.primaryDark} style={styles.contactIcon} />
            <Text style={styles.contactText}>safdarshaheenkhan@gmail.com</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: colors.primaryDark,
    paddingTop: 55,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFF',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 10,
  },
  bodyText: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 4,
  },
  listItem: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 6,
    paddingLeft: 4,
  },
  highlight: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  bold: {
    fontWeight: '700',
    color: colors.text,
  },
  contactCard: {
    backgroundColor: '#F0F9F4',
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primaryDark,
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactIcon: {
    marginRight: 10,
  },
  contactText: {
    fontSize: 15,
    color: colors.textMain,
    fontWeight: '500',
  },
});
