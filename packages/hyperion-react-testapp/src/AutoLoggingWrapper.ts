/**
 * Copyright (c) Meta Platforms, Inc. and affiliates. All Rights Reserved.
 */

import { Channel } from "@hyperion/hook/src/Channel";
import * as AutoLogging from "@hyperion/hyperion-autologging/src/AutoLogging";
import { initFlowletTrackers } from "@hyperion/hyperion-flowlet/src/Index";
import * as IReact from "@hyperion/hyperion-react/src/IReact";
import * as IReactDOM from "@hyperion/hyperion-react/src/IReactDOM";
import React from 'react';
import * as ReactDOM from "react-dom";
import ReactDev from "react/jsx-dev-runtime";
import { FlowletManager } from "./FlowletManager";
import { ClientSessionID } from "@hyperion/hyperion-util/src/ClientSessionID";

export let interceptionStatus = "disabled";

export function init() {
  interceptionStatus = "enabled";

  const IReactModule = IReact.intercept("react", React, [])
  const IJsxRuntimeModule = IReact.interceptRuntime("react/jsx-dev-runtime", ReactDev as any, []);
  const IReactDOMModule = IReactDOM.intercept("react-dom", ReactDOM, []);

  const channel = new Channel<
    AutoLogging.ALChannelEvent &
    { test: [number, string] }
  >();
  channel.on("test").add((i, s) => { // Showing channel can be extend beyond expected types

  });

  initFlowletTrackers(FlowletManager);

  const testCompValidator = (name: string) => !name.match(/(^Surface(Proxy)?)/);

  console.log('csid:', ClientSessionID);

  AutoLogging.init({
    flowletManager: FlowletManager,
    domSurfaceAttributeName: 'data-surfaceid',
    componentNameValidator: testCompValidator,
    surface: {
      ReactModule: React as any,
      IReactDOMModule,
      IReactModule,
      IJsxRuntimeModule,
      channel,
    },
    uiEventPublisher: {
      channel,
      uiEvents: [
        {
          eventName: 'click',
          cacheElementReactInfo: true,
          eventFilter: (domEvent) => domEvent.isTrusted
        },
        {
          eventName: 'keydown',
          cacheElementReactInfo: true,
          interactableElementsOnly: false,
          eventFilter: (domEvent) => domEvent.code === 'Enter',
        },
        {
          eventName: 'keyup',
          cacheElementReactInfo: true,
          interactableElementsOnly: false,
          eventFilter: (domEvent) => domEvent.code === 'Enter',
        },
      ]
    },
    heartbeat: {
      channel,
      heartbeatInterval: 30 * 1000
    },
    surfaceMutationPublisher: {
      channel,
      cacheElementReactInfo: true,
    },
    network: {
      channel,
      requestFilter: request => !/robots/.test(request.url.toString()),
      requestUrlMarker: (request, params) => {
        const flowlet = FlowletManager.top();
        if (flowlet) {
          params.set('flowlet', flowlet.getFullName());
        }
      }
    }
  });

  ([
    'al_surface_mount',
    'al_surface_unmount',
    'al_heartbeat_event',
    'al_ui_event_capture',
    'al_ui_event_bubble',
  ] as const).forEach(eventName => {
    channel.on(eventName).add(ev => {
      console.log(eventName, ev, performance.now());
    });

  });

  ([
    'al_ui_event',
    'al_surface_mutation_event',
    'al_network_request',
    'al_network_response',
    'al_network_response',
  ] as const).forEach(eventName => {
    channel.on(eventName).add(ev => {
      console.log(eventName, ev, performance.now(), ev.flowlet?.getFullName());
    });
  });
}
