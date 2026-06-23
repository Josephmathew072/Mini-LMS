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
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password needs at least 6 characters'),
});

type FormData = z.infer<typeof schema>;

export default function LoginScreen() {
  const { login } = useAuthStore();
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
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);

    try {
      await login(data.email, data.password);
      router.replace('/(tabs)/home');
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ??
        'Login failed. Check your credentials.';

      Alert.alert('Login Failed', msg);
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
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingHorizontal: 24,
            paddingVertical: 32,
          }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="items-center mb-9">
            <Text className="text-[52px] mb-2">📖</Text>

            <Text
              className="text-3xl font-extrabold tracking-tight"
              style={{ color: colors.text }}
            >
              mini-lms
            </Text>

            <Text
              className="text-sm text-center mt-1.5"
              style={{ color: colors.textSecondary }}
            >
              Welcome back! Sign in to continue.
            </Text>
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
                  placeholder="••••••••"
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
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View className="flex-row justify-center mt-5">
            <Text
              className="text-sm"
              style={{ color: colors.textSecondary }}
            >
              Don't have an account?{' '}
            </Text>

            <Link
              href="/register"
              className="text-sm font-semibold"
              style={{ color: colors.primary }}
            >
              Create one
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}