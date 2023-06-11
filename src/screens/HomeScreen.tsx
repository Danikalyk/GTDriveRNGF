import {Button, Layout, Text} from '@ui-kitten/components';
import React from 'react';

type Props = {};

const HomeScreen = (props: Props) => {
  return (
    <Layout style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text category="h1">HOME</Text>
    </Layout>
  );
};

export default HomeScreen;
