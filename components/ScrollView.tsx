import { forwardRef } from "react";
import { ScrollView as RNScrollView, ScrollViewProps } from "react-native";

export const ScrollView = forwardRef<any, ScrollViewProps>((props, ref) => {
  return (
    <RNScrollView
      className="bg-white dark:bg-black h-full"
      contentContainerClassName="p-8"
      automaticallyAdjustsScrollIndicatorInsets
      contentInsetAdjustmentBehavior="automatic"
      contentInset={{ bottom: 0 }}
      scrollIndicatorInsets={{ bottom: 0 }}
      {...props}
      ref={ref}
    />
  );
});
