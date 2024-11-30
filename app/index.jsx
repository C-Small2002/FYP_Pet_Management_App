import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, PixelRatio, Image } from 'react-native';
import { Link } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import images from '../constants/images';

const padding = PixelRatio.get() * 4;

export default function App() {
  return (
   <SafeAreaView style={styles.SafeAreaView}>
    <ScrollView contentContainerStyle={{height: '100%'}}>

    <View style={[styles.View, {paddingHorizontal: padding}]}>

      <View>
        <Text>Welcome to Zoomies! The All in One Pet Management App.

          <Link href={"./petprofiles"} style={{color: 'blue'}}>Get Started Today</Link>

        </Text>

      </View>
    </View>

    </ScrollView>
   </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  SafeAreaView:{
    backgroundColor:'#CAF0F8'
  },

  View:{
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    alignItems: 'center'
  },

  Onboard:{
    maxWidth: 380,
    width: '100%',
    height: 380
  },

  Text:{
    justifyContent: 'center',
    alignItems:'center',
    textAlign:'center',
    fontSize: 24
  }

});
