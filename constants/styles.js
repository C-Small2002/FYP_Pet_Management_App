import { StyleSheet, Dimensions } from "react-native";
import { Directions } from "react-native-gesture-handler";

const COLOURS = {
  primary: '#4287f5',
	secondary: '#3066be',
  black: '#000',
	accentWhite: '#ffffff',
	accentBlue: '#E8F1FF',
	backgroundGray: '#F2F2F2',
  backgroundWhite: '#F9F9F9',
  accentGray: '#ddd'
}

const {width, height} = Dimensions.get('window'); //gets the width and height of the devices screen

export default StyleSheet.create({

  defaultContainer:{
    flex:1,
    padding: width * 0.05,
 	},

  userText:{
		textAlign:'left',
		padding: width*0.03,
		marginVertical: height*0.005,
		backgroundColor:COLOURS.primary,
		alignSelf: 'flex-end',
		borderRadius: width *0.03,
		maxWidth:'75%',
    borderColor:COLOURS.secondary,
    borderWidth: 2,
    color: COLOURS.accentWhite
 	},

  vetText: {
    textAlign: 'left',
    padding: width*0.03,
    marginVertical: height*0.005,
    backgroundColor:COLOURS.accentWhite,
    alignSelf: 'flex-start',
    borderRadius: width *0.03,
    maxWidth:'75%',
    borderWidth: 2,
    borderColor: COLOURS.accentGray
  },

  inputView:{
    flexDirection:'row',
    alignItems:'center',
    padding:height*0.01,
    borderTopWidth: 1,
    borderTopColor: COLOURS.accentGray
  },

  input:{
  	flex:1,
    borderColor: COLOURS.primary,
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
		borderColor: COLOURS.primary,
    elevation: 5
	},

	dropdownMenu: {
		borderWidth: 1,
		borderColor: COLOURS.primary,
		backgroundColor:COLOURS.accentWhite,
    elevation: 5
	},

  profileContainer:{
    marginTop: height *0.02,
    padding: width*0.04,
    backgroundColor :COLOURS.backgroundWhite,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLOURS.accentGray,
    //shadows for IOS
    shadowColor: COLOURS.black,
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 2},
    shadowRadius: 4,
    // shadows for Android
    elevation: 5 
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

  header2:{
    fontSize: width * 0.04,
    fontWeight: '600',
    marginBottom: height *0.01
  },

  header3:{
    fontSize: width * 0.05,
    fontWeight: 'bold',
    marginBottom: height *0.03
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
    borderWidth: 2,
    borderColor: COLOURS.accentGray,
    marginTop: height *0.02,
    padding: width *0.035,
    elevation:3,
    shadowColor: COLOURS.black,
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: width *0.02  
  },

  reminderText: {
    fontWeight: '500',
    fontSize: width * 0.045
  },

  reminderTime:{
    fontSize: width *0.035,
    marginVertical: height *0.01
  },

  reminderTextContainer: {
    flex: 1
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
  },

  loginContainer: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: width*0.06,
    paddingVertical: width*0.06
  },

  formInput: {
    flex: 1,
    color: COLOURS.black
  },

  formContainer: {
    width: "100%",
    height: height*0.08,
    paddingHorizontal: width *0.04,
    borderRadius: height*0.02,
    borderWidth: 2,
    borderColor: COLOURS.primary,
    flexDirection: "row",
    alignItems: "center"
  },

  formIcon: {
    width: width * 0.06,
    height: height*0.06,
  },

  logoText: {
    width: width *0.55,
    height: height*0.2,
    justifyContent: 'center'
  },

  authFieldSpacing: {
    marginBottom: height*0.03
  },

  buttonStyle: {
    marginTop: height *0.03,
    backgroundColor: COLOURS.primary,
    borderRadius: width*0.03,
    borderWidth:2,
    borderColor:COLOURS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    height: height *0.07,
    width: '100%'
  },

  buttonText: {
    color: COLOURS.accentWhite,
    fontWeight:'500'
  },

  background: {
    backgroundColor: COLOURS.backgroundWhite,
    height: '100%',
    width: '100%'
  },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  fabIcon: {
    width: '50%',
    height: '50%',
    resizeMode: 'contain'
  },

  fab: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: {width: 0 , height: 2},
    shadowColor: COLOURS.black,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    backgroundColor: COLOURS.primary,
    borderColor: COLOURS.secondary,
    borderWidth: 2
  },

  fabBottomRight: {
    bottom: height *0.05,
    right: width *0.05
  },

  fabBottomLeft: {
    bottom: height *0.05,
    left: width *0.05
  },

  fabMedium: {
    width: width *0.15,
    height: width *0.15,
    borderRadius: (width * 0.2) /2
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)'
  },

  modalContent: {
    width: '80%',
    backgroundColor: COLOURS.backgroundWhite,
    padding: 10,
    alignItems: 'center',
    elevation: 5,
    alignItems: 'center',
    shadowColor: COLOURS.black,
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    borderRadius: 10,
    borderWidth: 3,
    borderColor: COLOURS.accentGray
  },

  modalSubContainer: {
    flex: 1,
    flexDirection:'row',
    alignItems: 'center',
  },

  modalSubContents: {
    marginBottom: height*0.03,
    width: "100%",
    height: height*0.08,
    paddingHorizontal: width *0.04,
    borderRadius: height*0.02,
    borderWidth: 2,
    borderColor: COLOURS.primary,
    flexDirection: "row",
    alignItems: "center"
  },

  radioGroupContainer: {
    marginVertical: height *0.015,
    alignItems: 'flex-start',
    borderColor: COLOURS.primary
  },

  radioButtonContainer: {
    marginBottom: height * 0.007 ,
  },

  radioButton: {
    borderWidth: 2,
    borderColor: COLOURS.secondary,
    backgroundColor: '#f5f5f5',
    padding: height *0.01,
    borderRadius: 5
  },

  radioLabel: {
    fontSize: width*0.04,
    color: COLOURS.black
  }

})  