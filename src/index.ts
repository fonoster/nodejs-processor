#!/usr/bin/env node
/*
 * Copyright (C) 2023 by Fonoster Inc (https://fonoster.com)
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
import Processor, { MessageRequest, Response } from "@routr/processor";
import { getLogger } from "@fonoster/logger";
import { LocationClient } from "@routr/location";
import { registerHandler, messageHandler } from "./handlers";
import { BIND_ADDR, LOCATION_ADDR } from "./envs";

const locationClient = new LocationClient({ addr: LOCATION_ADDR });

const logger = getLogger({
  service: "instant-messaging",
  filePath: __filename
});

new Processor({ bindAddr: BIND_ADDR, name: "instant-messaging" }).listen(
  async (req: MessageRequest, res: Response) => {
    try {
      const method = req.method.toString();

      if (method === "REGISTER") {
        return registerHandler(locationClient, req, res);
      } else if (method === "MESSAGE") {
        return messageHandler(locationClient, req, res);
      }

      res.sendNotImplemented();
    } catch (err) {
      logger.error("An error occurred:", { error: err.message });
      res.sendInternalServerError();
    }
  }
);
