#!/usr/bin/env bash

channel_name=$1

export PATH=${ROOTDIR}/../bin:${PWD}/../bin:$PATH

# Use the orderer organization's TLS certificates (from awkum.com)
export ORDERER_ADMIN_TLS_SIGN_CERT=${PWD}/organizations/ordererOrganizations/awkum.com/orderers/orderer.awkum.com/tls/server.crt
export ORDERER_ADMIN_TLS_PRIVATE_KEY=${PWD}/organizations/ordererOrganizations/awkum.com/orderers/orderer.awkum.com/tls/server.key
export ORDERER_CA=${PWD}/organizations/ordererOrganizations/awkum.com/tlsca/tlsca.awkum.com-cert.pem

osnadmin channel join --channelID ${channel_name} --config-block ./channel-artifacts/${channel_name}.block -o localhost:7053 --ca-file "$ORDERER_CA" --client-cert "$ORDERER_ADMIN_TLS_SIGN_CERT" --client-key "$ORDERER_ADMIN_TLS_PRIVATE_KEY" >> log.txt 2>&1