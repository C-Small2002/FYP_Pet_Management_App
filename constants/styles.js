import { StyleSheet, Dimensions } from "react-native";

const COLOURS = {
    primary: '#4287f5',
		secondary: '#3066be',
		accentWhite: '#ffffff',
		accentBlue: '#E8F1FF',
		backgroundGray: '#F2F2F2'
}

const {width, height} = Dimensions.get('window'); //gets the width and height of the devices screen

export default StyleSheet.create({

  defaultContainer:{
    flex:1,
    justifyContent: 'center',
    alignItems: 'center',
 	},

  userText:{
		textAlign:'right',
		padding: width*0.03,
		marginVertical: height*0.005,
		backgroundColor:COLOURS.primary,
		alignSelf: 'flex-end',
		borderRadius: width *0.03,
		maxWidth:'75%'
 	},

  vetText: {
    textAlign: 'left',
    padding: width*0.03,
    marginVertical: height*0.005,
    backgroundColor:COLOURS.accentWhite,
    alignSelf: 'flex-start',
    borderRadius: width *0.03,
    maxWidth:'75%'
  },

  inputView:{
    flexDirection:'row',
    alignItems:'center',
    padding:height*0.01,
    borderTopWidth: 1,
    borderTopColor: '#ddd'
  },

  input:{
  	flex:1,
    borderColor: COLOURS.secondary,
    borderWidth: 1,
    borderRadius: width*0.05,
    paddingHorizontal: width*0.04,
    paddingVertical: height*0.01,
    marginRight: width *0.02
  },

  vetContainer:{
    flex:1,
    paddingTop: height*0.03
    
  },

  scrollContent:{
    justifyContent:'flex-end',
    paddingBottom: height *0.02
  },

	dropdownContainer:{
		width: width,
		paddingBottom : height *0.02
	},

	dropdownSelector:{
		borderWidth:1,
		borderColor: COLOURS.secondary
	},

	dropdownMenu: {
		borderWidth: 1,
		borderColor: COLOURS.secondary,
		backgroundColor:COLOURS.accentWhite,
	}

})  