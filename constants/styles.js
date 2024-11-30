import { StyleSheet, Dimensions } from "react-native";

const COLOURS = {
  primary: '#4287f5',
	secondary: '#3066be',
  black: '#000',
	accentWhite: '#ffffff',
	accentBlue: '#E8F1FF',
	backgroundGray: '#F2F2F2',
  backgroundWhite: '#F9F9F9'
}

const {width, height} = Dimensions.get('window'); //gets the width and height of the devices screen

export default StyleSheet.create({

  defaultContainer:{
    flex:1,
    padding: width * 0.05,
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
		width: width *0.90,
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
	},

  profileContainer:{
    marginTop: height *0.02,
    padding: width*0.04,
    backgroundColor :COLOURS.backgroundWhite,
    borderRadius: 10,
    //shadows for IOS
    shadowColor: COLOURS.black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    // shadows for Android
    elevation: 3 
  },

  displayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom  : height *0.01
  },

  label:{
    fontSize:width * 0.04,
    flex:1
  },

  value: {
    fontSize: width *0.04,
    flex: 2,
    textAlign: 'right'
  },

  header:{
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height *0.01
  },

  petImage:{
    width: width *0.9,
    height: height*0.3,
    borderRadius: 15,
    alignSelf:'center',
    marginBottom: height *0.02
  },

  reminderItem: {
    backgroundColor: COLOURS.backgroundWhite,
    borderRadius: width *0.02,
    marginBottom: height * 0.01,
    padding: width *0.035,
    elevation:3,
    shadowColor: COLOURS.black,
    shadowOpacity: 0.1,
    shadowRadius: 4
  },

  reminderText: {
    fontWeight: '500',
    fontSize: width * 0.045
  },

  reminderTime:{
    fontSize: width *0.035,
    marginVertical: height *0.01
  },

  iconView:{
    flexDirection:'row',
    justifyContent:'flex-end',
    gap: width *0.02
  },

  icon:{
    width: width *0.06, 
    height: height *0.06,
    resizeMode: 'contain'
  },

  tempStyle: { //used to centre 
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  }

})  