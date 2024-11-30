import { View, Image, PixelRatio } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

import icons from '../../constants/icons'

const iconSize = PixelRatio.getFontScale() * 24 

const TabIcon = ({icon, color, name, focused,}) => {
    return (
        <View>
            <Image
                source={icon}
                resizeMode="contain"
                style={{height: iconSize, width: iconSize, tintColor:color}}
            />
        </View>
    )
}

const TabsLayout = () => {
  return (
    
    <Tabs>

        <Tabs.Screen
        name="petprofiles"
        options={{
            title: 'Pet Profiles',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.paw}
                    color={color}
                    name="Pet Profiles"
                    focused={focused}
                />
            )
        }}
        />

        <Tabs.Screen
            name="reminders"
            options={{
            title: 'Reminders',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.reminders}
                    color={color}
                    name="Reminders"
                    focused={focused}
                />
            )
        }}
        />

        <Tabs.Screen
            name="vetlocator"
            options={{
            title: 'Vet Locator',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.location}
                    color={color}
                    name="Vet Locator"
                    focused={focused}
                />
            )
        }}
        />

        <Tabs.Screen
            name="pocketvet"
            options={{
            title: 'Pocket Vet',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.health_plus}
                    color={color}
                    name="Pocket Vet"
                    focused={focused}
                />
            )
        }}
        />

        <Tabs.Screen
            name="profile"
            options={{
            title: 'User Profile',
            headerShown: false,
            tabBarIcon: ({color, focused}) => (
                <TabIcon
                    icon={icons.person}
                    color={color}
                    name="User Profile"
                    focused={focused}
                />
            )
        }}
        />
        
    </Tabs>
    
  )
}

export default TabsLayout
