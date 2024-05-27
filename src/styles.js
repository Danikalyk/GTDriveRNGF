import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    containerCards: {
        margin: 5
    },
    containerCard: {
        flex: 1,
        flexDirection: 'row'
    },
    containerCardBody: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 25
    },
    containerCardText: {
        flex: 1,
        flexDirection: 'column',
        paddingLeft: 20
    },
    backdrop: { 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },


    textHeaderCard: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        flexWrap: 'wrap', 
        //justifyContent: 'space-between'
    },

    textHeaderCardIcon: {
        marginRight: 10, 
    },
    textTimeLeft: {
        marginRight: 10,
    },
    textBodyCardWithLeftView: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'flex-start',
        backgroundColor: 'rgba(255, 255, 255, 0)',
    },
    textHeaderCardOrder: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        flexWrap: 'wrap', 
        padding: 10,
        justifyContent: 'space-between'
    },

    textHeaderCardRoute: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        flexWrap: 'wrap', 
        justifyContent: 'space-between'
    },

    titleList: {
        margin: 10,    
    }
  }
);