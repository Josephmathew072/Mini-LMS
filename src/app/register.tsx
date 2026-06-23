import { useTheme } from '@/context/ThemeContext';
import { useAuthStore } from '@/stores/authStore';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

const schema = z.object({
  username: z.string().min(3, 'Username needs at least 3 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password needs at least 8 characters'),
});

type FormData = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { register } = useAuthStore();
  const { colors } = useTheme();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    let updatedUsername = data.username;
    updatedUsername = updatedUsername.replace(
      /[a-zA-Z]/g,
      (char) => char.toLowerCase()
    );

    try {
      await register(
        updatedUsername,
        data.email,
        data.password
      );

      router.replace('/(tabs)/home');
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ??
        'Registration failed. Please try again.';

      Alert.alert('Registration Failed', msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
        >
          {/* Header */}
          <View className="items-center mb-9">
            <Text className="text-[52px] mb-2">🎓</Text>

            <Text
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: colors.text }}
            >
              Create Account
            </Text>

            <Text
              className="text-sm text-center mt-1.5"
              style={{ color: colors.textSecondary }}
            >
              Start your learning journey today.
            </Text>
          </View>

          {/* Username */}
          <View className="mb-4">
            <Text
              className="text-sm font-semibold mb-1.5"
              style={{ color: colors.text }}
            >
              Username
            </Text>

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="rounded-xl px-4 py-3 text-[15px] border-[1.5px]"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.username
                      ? colors.error
                      : colors.border,
                  }}
                  placeholder="your_username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            {errors.username && (
              <Text
                className="text-xs mt-1"
                style={{ color: colors.error }}
              >
                {errors.username.message}
              </Text>
            )}
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text
              className="text-sm font-semibold mb-1.5"
              style={{ color: colors.text }}
            >
              Email
            </Text>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="rounded-xl px-4 py-3 text-[15px] border-[1.5px]"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.email
                      ? colors.error
                      : colors.border,
                  }}
                  placeholder="you@example.com"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            {errors.email && (
              <Text
                className="text-xs mt-1"
                style={{ color: colors.error }}
              >
                {errors.email.message}
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-4">
            <Text
              className="text-sm font-semibold mb-1.5"
              style={{ color: colors.text }}
            >
              Password
            </Text>

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="rounded-xl px-4 py-3 text-[15px] border-[1.5px]"
                  style={{
                    backgroundColor: colors.surface,
                    color: colors.text,
                    borderColor: errors.password
                      ? colors.error
                      : colors.border,
                  }}
                  placeholder="Min. 8 characters"
                  placeholderTextColor={colors.textSecondary}
                  secureTextEntry
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />

            {errors.password && (
              <Text
                className="text-xs mt-1"
                style={{ color: colors.error }}
              >
                {errors.password.message}
              </Text>
            )}
          </View>

          {/* Submit */}
          <TouchableOpacity
            className={`rounded-xl py-4 items-center mt-2 ${
              submitting ? 'opacity-65' : ''
            }`}
            style={{ backgroundColor: colors.primary }}
            onPress={handleSubmit(onSubmit)}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={colors.background} />
            ) : (
              <Text className="text-white font-bold text-base">
                Create Account
              </Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View className="flex-row justify-center mt-5">
            <Text
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              Already have an account?{' '}
            </Text>

            <Link
              href="/login"
              className="text-sm font-semibold"
              style={{ color: colors.primary }}
            >
              Sign in
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}