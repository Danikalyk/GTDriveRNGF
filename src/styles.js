import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    containerCards: {
        margin: 10
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
        flexWrap: 'wrap' 
    },
    textHeaderCardIcon: {
        marginRight: 10, 
    },
    textTimeLeft: {
        marginRight: 7,
    },
    textBodyCardWithLeftView: {
        flex: 1, 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'flex-start'
    },

    titleList: {
        margin: 10,    
    }
  }
);