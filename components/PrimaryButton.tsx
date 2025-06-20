import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';
import Colors from '../constants/Colors';

export default function PrimaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const animateIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const animateOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Pressable onPressIn={animateIn} onPressOut={animateOut} onPress={onPress}>
      <Animated.View style={[styles.button, { transform: [{ scale }] }]}>
        <Text style={styles.text}>{label}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
    alignItems: 'center',
  },
  text: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
});
