import React from 'react';
import numeral from 'numeral';


// Makes the passed number appear in the format: 1231 -> 1k, 123 -> 123, 4124124 -> 4m
export function DisplayCount(props) {
    return (<span className={props.className}>{numeral(props.children).format('0a')}</span>);
};