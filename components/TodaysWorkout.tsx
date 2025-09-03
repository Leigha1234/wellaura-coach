import { Link } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType } from 'react-native';
import { Button, H2, H4, View, XStack, YStack } from 'tamagui';

type TodaysWorkoutProps = {
  title: string;
  subtitle: string;
  buttonText: string;
  image: ImageSourcePropType;
};

export function TodaysWorkout({ title, subtitle, buttonText, image }: TodaysWorkoutProps) {
  return (
    <View
      backgroundColor="$color2"
      borderRadius="$6"
      padding="$4"
      elevation="$2"
      shadowColor="#00000030">
      <XStack alignItems="center" space="$4">
        {/* Image */}
        <Image
          source={image}
          style={{ width: 100, height: 100, borderRadius: 12 }}
          resizeMode="cover"
        />

        {/* Content Stack */}
        <YStack flex={1} space="$2">
          <H2
            fontSize="$6"
            fontWeight="bold"
            numberOfLines={1}
            ellipsizeMode="tail"
            color="$color12">
            {title}
          </H2>
          <H4
            fontSize="$4"
            numberOfLines={1}
            ellipsizeMode="tail"
            color="$color10">
            {subtitle}
          </H4>
          <Link href="/" asChild>
            <Button
              theme="active"
              size="$3"
              marginTop="$2"
              pressStyle={{ scale: 0.97 }}
              animateOnly={['transform']}>
              {buttonText}
            </Button>
          </Link>
        </YStack>
      </XStack>
    </View>
  );
}