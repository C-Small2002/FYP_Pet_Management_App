import { Text, View, ActivityIndicator, Alert } from 'react-native'
import React, {useEffect, useState} from 'react'
import styles from '../../constants/styles'
import * as Location from 'expo-location'
import MapView, {Marker} from 'react-native-maps'
import { SafeAreaView } from 'react-native-safe-area-context'



const VetLocator = () => {

  const [location, setLocation] = useState(null);
  const [vets, setVets] = useState([]);
  const [loading, setLoading] = useState(true);

  //Using the Haversine formula to get the distance between two points in kilometers
  const getDistanceInKm = (lat1, long1, lat2, long2) => {

    const toRad = (value) => (value * Math.PI) / 180;

    const R = 6371; //Earths radius
    const dLat = toRad(lat2 - lat1);
    const dLong = toRad(long2 - long1);

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLong / 2) **2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c

  };

  const findNearbyVets = async (latitude, longitude) => {

    const radius = 5000;
    const type = 'veterinary_care';

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=AIzaSyDwNjkRSGhU2rw3wA_V-1HIe225HtsIKqw`;

    try {

      const response = await fetch(url);
      const data = await response.json()

      if(data.results) {
        return data.results.map((place) => {
          const distance = getDistanceInKm(
            latitude,
            longitude,
            place.geometry.location.lat,
            place.geometry.location.lng
          );

          return{
            id: place.place_id,
            name: place.name,
            latitude: place.geometry.location.lat,
            longitude: place.geometry.location.lng,
            openNow: place.opening_hours?.open_now ?? false,
            distance
          };

        });
      }
      else {
        console.warn('No Results from Google Places');
        return [];
      }
      
    } 
    catch (error) {
      console.error('Google Places API error: ', error);
      return [];
    }

  }

  useEffect(() => {
    (async () => {
      setLoading(true);

      const {status} = await Location.requestForegroundPermissionsAsync();

      if(status !== 'granted') {
        Alert.alert('Location Permission Denied. To Enable Location Permissions, Please Go to Your Settings');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc.coords);

      const nearbyVets = await findNearbyVets(loc.coords.latitude, loc.coords.longitude);
      setVets(nearbyVets);
      setLoading(false);      

    }) ();
  }, []);

  if(loading || !location) {
    return (
      <View style={styles.tempStyle}>
        <ActivityIndicator size={'large'}/>
        <Text>Finding Nearby Open Vets...</Text>
      </View>
    )
  }

  return (
    <SafeAreaView style={styles.mapContainer}>
      <MapView 
        style={styles.map}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
      >

        {vets.map((vet) =>(
          <Marker
            testID={`marker-${vet.id}`}
            key={vet.id}
            coordinate={{
              latitude: vet.latitude,
              longitude: vet.longitude
            }}
            title={vet.name}
            description={`${vet.openNow ? 'Open Now' : 'Closed'} ${parseFloat(vet.distance).toFixed(2)} km away`}
            pinColor={vet.openNow ? 'green' : '#f54242'}
          />
        ))}

      </MapView>
    </SafeAreaView>
  )
}

export default VetLocator

