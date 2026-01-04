/*
 * Copyright (C) 2026 by Fonoster Inc (https://fonoster.com)
 * http://github.com/fonoster
 *
 * This file is part of nodejs-processor
 *
 * Licensed under the MIT License (the "License");
 * you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *    https://opensource.org/licenses/MIT
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import {
  Alterations,
  Target,
  Helper as ProcessHelper,
  MessageRequest,
  Response
} from "@routr/processor";
import { getLogger } from "@fonoster/logger";
import { LocationClient, Helper as LocationHelper } from "@routr/location";
import { pipe } from "fp-ts/function";

const logger = getLogger({
  service: "instant-messaging",
  filePath: __filename
});

export const registerHandler = async (
  locationClient: LocationClient,
  req: MessageRequest,
  res: Response
) => {
  await locationClient.addRoute({
    aor: Target.getTargetAOR(req),
    route: LocationHelper.createRoute(req),
    maxContacts: 1
  });
  res.sendOk();
};

export const messageHandler = async (
  locationClient: LocationClient,
  req: MessageRequest,
  res: Response
) => {
  try {
    // If the request is an SIP response, we must remove the top Via header // and forward the message backe to the EdgePort
    if (ProcessHelper.isTypeResponse(req)) {
      return res.send(Alterations.removeTopVia(req));
    }

    // We look for the route to the target using the Location Service
    const route = (
      await locationClient.findRoutes({
        aor: Target.getTargetAOR(req),
        callId: req.ref
      })
    )[0];

    // And return 404 if the route is not found
    if (!route) return res.sendNotFound();

    // This ensure the message is forward to the correct EdgePort
    if (req.edgePortRef !== route.edgePortRef) {
      return res.send(
        pipe(
          req,
          Alterations.addSelfVia(route),
          Alterations.addSelfRecordRoute(route),
          Alterations.addRouteToPeerEdgePort(route),
          Alterations.addRouteToNextHop(route),
          Alterations.addXEdgePortRef,
          Alterations.decreaseMaxForwards
        )
      );
    }

    // Normal message processing
    return res.send(
      pipe(
        req,
        Alterations.decreaseMaxForwards,
        Alterations.removeAuthorization,
        Alterations.removeSelfRoutes,
        Alterations.removeXEdgePortRef,
        Alterations.addSelfVia(route),
        Alterations.addRouteToNextHop(route)
      )
    );
  } catch (err) {
    logger.error("An error occurred:", { error: err.message });
    res.sendInternalServerError();
  }
};
