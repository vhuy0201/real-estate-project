import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Image,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { logout } from '../../store/auth/authSlice';
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../hooks/useProfile';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigation';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const ROLE_LABELS: Record<string, string> = {
  buyer: 'Người mua',
  seller: 'Người bán',
  agent: 'Môi giới',
  admin: 'Quản trị viên',
};

const ROLE_COLORS: Record<string, string> = {
  buyer: '#3B82F6',
  seller: '#10B981',
  agent: '#F59E0B',
  admin: '#EF4444',
};

export default function ProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation<NavProp>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { profile, isLoadingProfile, refetchProfile } = useProfile();

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    dispatch(logout());
  };

  const currentData = profile || user;
  const roleColor = ROLE_COLORS[currentData?.role || 'buyer'] || '#3B82F6';
  const roleLabel = ROLE_LABELS[currentData?.role || 'buyer'] || currentData?.role;
  const firstLetter = currentData?.fullName ? currentData.fullName.charAt(0).toUpperCase() : '?';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ── Header gradient area ── */}
        <View style={styles.headerBg}>
          <Text style={styles.headerTitle}>Hồ Sơ Cá Nhân</Text>
        </View>

        {/* ── Avatar card ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarRing}>
            {currentData?.avatar ? (
              <Image source={{ uri: currentData.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarPlaceholder, { backgroundColor: roleColor }]}>
                <Text style={styles.avatarLetter}>{firstLetter}</Text>
              </View>
            )}
          </View>

          <Text style={styles.userName}>{currentData?.fullName || 'Người dùng'}</Text>
          <Text style={styles.userEmail}>{currentData?.email}</Text>

          <View style={[styles.roleBadge, { backgroundColor: roleColor + '18' }]}>
            <View style={[styles.roleDot, { backgroundColor: roleColor }]} />
            <Text style={[styles.roleText, { color: roleColor }]}>{roleLabel}</Text>
          </View>
        </View>

        {/* ── Info cards ── */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#EFF6FF' }]}>
                <Ionicons name="person-outline" size={20} color="#3B82F6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Họ và tên</Text>
                <Text style={styles.infoValue}>{currentData?.fullName || '—'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="mail-outline" size={20} color="#22C55E" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{currentData?.email || '—'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#FFF7ED' }]}>
                <Ionicons name="call-outline" size={20} color="#F97316" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{currentData?.phone || 'Chưa cập nhật'}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: '#F5F3FF' }]}>
                <Ionicons name="calendar-outline" size={20} color="#8B5CF6" />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày tham gia</Text>
                <Text style={styles.infoValue}>
                  {currentData?.createdAt
                    ? new Date(currentData.createdAt).toLocaleDateString('vi-VN')
                    : '—'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Action menu ── */}
        <View style={styles.menuSection}>
          <Text style={styles.menuSectionTitle}>Cài đặt tài khoản</Text>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('EditProfile' as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="create-outline" size={20} color="#3B82F6" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Chỉnh sửa hồ sơ</Text>
              <Text style={styles.menuDesc}>Cập nhật tên, số điện thoại, ảnh đại diện</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ChangePassword' as any)}
          >
            <View style={[styles.menuIcon, { backgroundColor: '#FEF2F2' }]}>
              <Ionicons name="lock-closed-outline" size={20} color="#EF4444" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Đổi mật khẩu</Text>
              <Text style={styles.menuDesc}>Thay đổi mật khẩu đăng nhập</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#CBD5E1" />
          </TouchableOpacity>
        </View>

        {/* ── Logout button ── */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} activeOpacity={0.8} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={22} color="#EF4444" />
            <Text style={styles.logoutText}>Đăng xuất</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#64748B',
  },

  /* ── Header ── */
  headerBg: {
    backgroundColor: '#1e3a8a',
    paddingTop: 16,
    paddingBottom: 60,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },

  /* ── Avatar ── */
  avatarSection: {
    alignItems: 'center',
    marginTop: -44,
    marginBottom: 20,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    backgroundColor: '#FFFFFF',
    elevation: 6,
    shadowColor: '#1e3a8a',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 48,
  },
  avatarPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
  },
  userEmail: {
    marginTop: 4,
    fontSize: 14,
    color: '#64748B',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  roleDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
  },

  /* ── Info card ── */
  infoSection: {
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginLeft: 54,
  },

  /* ── Menu section ── */
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    marginLeft: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 1 },
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1E293B',
  },
  menuDesc: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },

  /* ── Logout ── */
  logoutSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#EF4444',
    marginLeft: 8,
  },
});
