// Copyright 2018-2022 the Deno authors. All rights reserved. MIT license.

import { type CallbackWithError, makeCallback } from "./_fs_common.ts";
import { fs, os } from "../internal_binding/constants.ts";
import { getValidatedPath, getValidMode } from "../internal/fs/utils.mjs";
import type { Buffer } from "../buffer.ts";
import { promisify } from "../internal/util.mjs";

export function access(
  path: string | Buffer | URL,
  mode: number | CallbackWithError,
  callback?: CallbackWithError,
) {
  if (typeof mode === "function") {
    callback = mode;
    mode = fs.F_OK;
  }

  path = getValidatedPath(path).toString();
  mode = getValidMode(mode, "access");
  const cb = makeCallback(callback);

  Deno.lstat(path).then((info) => {
    if (info.mode === null) {
      // If the file mode is unavailable, we pretend it has
      // the permission
      cb(null);
      return;
    }
    const m = +mode || 0;
    let fileMode = +info.mode || 0;
    if (Deno.build.os !== "windows" && info.uid === Deno.getUid()) {
      // If the user is the owner of the file, then use the owner bits of
      // the file permission
      fileMode >>= 6;
    }
    // TODO(kt3k): Also check the case when the user belong to the group
    // of the file
    if ((m & fileMode) === m) {
      // all required flags exist
      cb(null);
    } else {
      // some required flags don't
      // deno-lint-ignore no-explicit-any
      const e: any = new Error(`EACCES: permission denied, access '${path}'`);
      e.path = path;
      e.syscall = "access";
      e.errno = os.errno.EACCES;
      e.code = "EACCES";
      cb(e);
    }
  }, (err) => {
    if (err instanceof Deno.errors.NotFound) {
      // deno-lint-ignore no-explicit-any
      const e: any = new Error(
        `ENOENT: no such file or directory, access '${path}'`,
      );
      e.path = path;
      e.syscall = "access";
      e.errno = os.errno.ENOENT;
      e.code = "ENOENT";
      cb(e);
    } else {
      cb(err);
    }
  });
}

export const accessPromise = promisify(access) as (
  path: string | Buffer | URL,
  mode?: number,
) => Promise<void>;

export function accessSync(path: string | Buffer | URL, mode?: number) {
  path = getValidatedPath(path).toString();
  mode = getValidMode(mode, "access");
  try {
    const info = Deno.lstatSync(path.toString());
    if (info.mode === null) {
      // If the file mode is unavailable, we pretend it has
      // the permission
      return;
    }
    const m = +mode! || 0;
    let fileMode = +info.mode! || 0;
    if (Deno.build.os !== "windows" && info.uid === Deno.getUid()) {
      // If the user is the owner of the file, then use the owner bits of
      // the file permission
      fileMode >>= 6;
    }
    // TODO(kt3k): Also check the case when the user belong to the group
    // of the file
    if ((m & fileMode) === m) {
      // all required flags exist
    } else {
      // some required flags don't
      // deno-lint-ignore no-explicit-any
      const e: any = new Error(`EACCES: permission denied, access '${path}'`);
      e.path = path;
      e.syscall = "access";
      e.errno = os.errno.EACCES;
      e.code = "EACCES";
      throw e;
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      // deno-lint-ignore no-explicit-any
      const e: any = new Error(
        `ENOENT: no such file or directory, access '${path}'`,
      );
      e.path = path;
      e.syscall = "access";
      e.errno = os.errno.ENOENT;
      e.code = "ENOENT";
      throw e;
    } else {
      throw err;
    }
  }
}
