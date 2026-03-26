import { View, Text, TouchableOpacity } from 'react-native';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/auth/authSlice';

export default function HomeScreen() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold text-gray-800 mb-4">Home Screen</Text>
      <Text className="text-base text-gray-500 mb-8">Welcome to Real Estate App</Text>
      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-500 px-6 py-3 rounded-lg"
      >
        <Text className="text-white font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
